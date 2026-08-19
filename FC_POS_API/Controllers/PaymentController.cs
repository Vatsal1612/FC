using System.Data;
using FC_POS_API.Models;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace FC_POS_API.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly string _connectionString;

        public PaymentController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? configuration.GetConnectionString("DbConnectionString") 
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        // POST /api/payment/order
        [HttpPost("order")]
        public async Task<IActionResult> CreatePaymentOrder([FromBody] CreatePaymentDto dto)
        {
            int paymentId = 0;
            string orderId = !string.IsNullOrEmpty(dto.RazorpayOrderId) 
                ? dto.RazorpayOrderId 
                : $"order_{Guid.NewGuid().ToString("N").Substring(0, 14)}";

            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_CreatePayment", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_subscription_id", dto.SubscriptionId);
                    cmd.Parameters.AddWithValue("p_amount", dto.Amount);
                    cmd.Parameters.AddWithValue("p_order_id", orderId);

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            paymentId = Convert.ToInt32(reader["payment_id"]);
                        }
                    }
                }
            }

            return Ok(new Payment
            {
                PaymentId = paymentId,
                SubscriptionId = dto.SubscriptionId,
                Amount = dto.Amount,
                RazorpayOrderId = orderId,
                PaymentStatus = "Pending",
                CreatedAt = DateTime.UtcNow
            });
        }

        // POST /api/payment/verify
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentDto dto)
        {
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                
                // Update payment status
                using (var cmd = new MySqlCommand("sp_UpdatePaymentStatus", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_payment_id", dto.PaymentId);
                    cmd.Parameters.AddWithValue("p_payment_id_razorpay", dto.RazorpayPaymentId);
                    cmd.Parameters.AddWithValue("p_status", dto.Status);
                    await cmd.ExecuteNonQueryAsync();
                }

                // If payment is success, update subscription status to Active
                if (string.Equals(dto.Status, "Success", StringComparison.OrdinalIgnoreCase))
                {
                    using (var cmdSub = new MySqlCommand("sp_UpdateSubscriptionStatus", conn))
                    {
                        cmdSub.CommandType = CommandType.StoredProcedure;
                        cmdSub.Parameters.AddWithValue("p_subscription_id", dto.SubscriptionId);
                        cmdSub.Parameters.AddWithValue("p_status", "Active");
                        await cmdSub.ExecuteNonQueryAsync();
                    }
                }
            }

            return Ok(new
            {
                success = true,
                paymentId = dto.PaymentId,
                subscriptionId = dto.SubscriptionId,
                status = dto.Status,
                message = dto.Status == "Success" ? "Payment verified and subscription activated successfully." : "Payment verification failed."
            });
        }
    }
}

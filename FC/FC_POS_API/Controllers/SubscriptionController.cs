using System.Data;
using FC_POS_API.Models;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace FC_POS_API.Controllers
{
    [ApiController]
    [Route("api/subscription")]
    public class SubscriptionController : ControllerBase
    {
        private readonly string _connectionString;

        public SubscriptionController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? configuration.GetConnectionString("DbConnectionString") 
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        // POST /api/subscription
        [HttpPost]
        public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionDto dto)
        {
            int subscriptionId = 0;
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                var restaurantId = await ResolveRestaurantIdAsync(conn, dto);
                if (restaurantId == null)
                {
                    return BadRequest(new { message = "A valid restaurant account is required before starting a subscription." });
                }

                using (var cmd = new MySqlCommand("sp_CreateSubscription", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_restaurant_id", restaurantId.Value);
                    cmd.Parameters.AddWithValue("p_plan_id", dto.PlanId);
                    cmd.Parameters.AddWithValue("p_amount", dto.Amount);

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            subscriptionId = reader.GetInt32Safe("subscription_id");
                        }
                    }
                }
            }

            return await GetSubscription(subscriptionId);
        }

        private static async Task<int?> ResolveRestaurantIdAsync(MySqlConnection conn, CreateSubscriptionDto dto)
        {
            if (dto.RestaurantId > 0)
            {
                using var existingCommand = new MySqlCommand(
                    "SELECT restaurant_id FROM restaurants WHERE restaurant_id = @restaurant_id", conn);
                existingCommand.Parameters.AddWithValue("@restaurant_id", dto.RestaurantId);
                var existingId = await existingCommand.ExecuteScalarAsync();
                if (existingId != null && existingId != DBNull.Value)
                {
                    return Convert.ToInt32(existingId);
                }
            }

            if (string.IsNullOrWhiteSpace(dto.RestaurantName) || string.IsNullOrWhiteSpace(dto.RestaurantEmail))
            {
                return null;
            }

            using var findCommand = new MySqlCommand(
                "SELECT restaurant_id FROM restaurants WHERE email = @email", conn);
            findCommand.Parameters.AddWithValue("@email", dto.RestaurantEmail.Trim());
            var matchingId = await findCommand.ExecuteScalarAsync();
            if (matchingId != null && matchingId != DBNull.Value)
            {
                return Convert.ToInt32(matchingId);
            }

            using var createCommand = new MySqlCommand(
                """
                INSERT INTO restaurants (name, email, phone, address)
                VALUES (@name, @email, @phone, @address);
                SELECT LAST_INSERT_ID();
                """, conn);
            createCommand.Parameters.AddWithValue("@name", dto.RestaurantName.Trim());
            createCommand.Parameters.AddWithValue("@email", dto.RestaurantEmail.Trim());
            createCommand.Parameters.AddWithValue("@phone", (object?)dto.RestaurantPhone?.Trim() ?? DBNull.Value);
            createCommand.Parameters.AddWithValue("@address", (object?)dto.RestaurantAddress?.Trim() ?? DBNull.Value);

            return Convert.ToInt32(await createCommand.ExecuteScalarAsync());
        }

        // GET /api/subscription/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetSubscription(int id)
        {
            Subscription? subscription = null;
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_GetSubscription", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_subscription_id", id);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            subscription = new Subscription
                            {
                                SubscriptionId = reader.GetInt32Safe("subscription_id"),
                                RestaurantId = reader.GetInt32Safe("restaurant_id"),
                                PlanId = reader.GetInt32Safe("plan_id"),
                                Amount = reader.GetDecimalSafe("amount"),
                                TrialEndDate = reader.GetDateTimeSafe("trial_end_date"),
                                NextBillingDate = reader.GetDateTimeSafe("next_billing_date"),
                                Status = reader.GetStringSafe("status", "Trial"),
                                CreatedAt = reader.GetDateTimeSafe("created_at"),
                                RestaurantName = reader.GetNullableStringSafe("restaurant_name"),
                                RestaurantEmail = reader.GetNullableStringSafe("restaurant_email"),
                                PlanName = reader.GetNullableStringSafe("plan_name")
                            };
                        }
                    }
                }
            }

            if (subscription == null)
            {
                return NotFound(new { message = $"Subscription with ID {id} not found." });
            }

            return Ok(subscription);
        }
    }
}

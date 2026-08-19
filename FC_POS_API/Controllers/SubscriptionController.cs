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
            int restaurantId = dto.RestaurantId > 0 ? dto.RestaurantId : 1;
            int subscriptionId = 0;

            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();

                // Ensure the restaurant row exists before FK insert
                using (var ensure = new MySqlCommand(
                    "INSERT IGNORE INTO restaurants (restaurant_id, name, email) VALUES (@rid, @rname, @remail)", conn))
                {
                    ensure.Parameters.AddWithValue("@rid", restaurantId);
                    ensure.Parameters.AddWithValue("@rname", "Maharaja Food");
                    ensure.Parameters.AddWithValue("@remail", $"restaurant{restaurantId}@foodchow.com");
                    await ensure.ExecuteNonQueryAsync();
                }

                using (var cmd = new MySqlCommand("sp_CreateSubscription", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_restaurant_id", restaurantId);
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

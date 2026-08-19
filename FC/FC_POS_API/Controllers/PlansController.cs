using System.Data;
using FC_POS_API.Models;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace FC_POS_API.Controllers
{
    [ApiController]
    [Route("api/plans")]
    public class PlansController : ControllerBase
    {
        private readonly string _connectionString;

        public PlansController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? configuration.GetConnectionString("DbConnectionString") 
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        // GET /api/plans
        [HttpGet]
        public async Task<IActionResult> GetPlans()
        {
            var plans = new List<SubscriptionPlan>();
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_GetPlans", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            plans.Add(new SubscriptionPlan
                            {
                                PlanId = reader.GetInt32Safe("plan_id"),
                                PlanName = reader.GetStringSafe("plan_name"),
                                PlanType = reader.GetStringSafe("plan_type"),
                                BillingCycle = reader.GetStringSafe("billing_cycle"),
                                Price = reader.GetDecimalSafe("price"),
                                TrialDays = reader.GetInt32Safe("trial_days", 14),
                                Description = reader.GetStringSafe("description"),
                                IsActive = reader.GetBooleanSafe("is_active", true)
                            });
                        }
                    }
                }
            }
            return Ok(plans);
        }

        // GET /api/plans/growth/features
        [HttpGet("growth/features")]
        public async Task<IActionResult> GetGrowthPlanFeatures()
        {
            var features = new List<GrowthFeature>();
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_GetGrowthPlanFeatures", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            features.Add(new GrowthFeature
                            {
                                FeatureId = reader.GetInt32Safe("feature_id"),
                                PlanId = reader.GetInt32Safe("plan_id"),
                                FeatureName = reader.GetStringSafe("feature_name"),
                                FeatureValue = reader.GetDecimalSafe("feature_value")
                            });
                        }
                    }
                }
            }
            return Ok(features);
        }

        // GET /api/plans/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPlanById(int id)
        {
            SubscriptionPlan? plan = null;
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_GetPlanDetails", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_plan_id", id);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            plan = new SubscriptionPlan
                            {
                                PlanId = reader.GetInt32Safe("plan_id"),
                                PlanName = reader.GetStringSafe("plan_name"),
                                PlanType = reader.GetStringSafe("plan_type"),
                                BillingCycle = reader.GetStringSafe("billing_cycle"),
                                Price = reader.GetDecimalSafe("price"),
                                TrialDays = reader.GetInt32Safe("trial_days", 14),
                                Description = reader.GetStringSafe("description"),
                                IsActive = reader.GetBooleanSafe("is_active", true)
                            };
                        }
                    }
                }
            }

            if (plan == null)
            {
                return NotFound(new { message = $"Plan with ID {id} not found." });
            }

            return Ok(plan);
        }
    }
}

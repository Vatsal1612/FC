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
                                TierName = reader.GetStringSafe("tier_name"),
                                BillingCycle = reader.GetStringSafe("billing_cycle"),
                                Price = reader.GetDecimalSafe("price"),
                                MonthlyPrice = reader.GetDecimalSafe("monthly_price"),
                                YearlyPrice = reader.GetDecimalSafe("yearly_price"),
                                OneTimePrice = reader.GetDecimalSafe("one_time_price"),
                                OriginalPrice = reader.GetDecimalSafe("original_price"),
                                TrialDays = reader.GetInt32Safe("trial_days", 14),
                                BadgeText = reader.GetNullableStringSafe("badge_text"),
                                Tagline = reader.GetNullableStringSafe("tagline"),
                                Description = reader.GetStringSafe("description"),
                                CtaText = reader.GetStringSafe("cta_text", "Start 14 Day Free Trial"),
                                LearnMoreUrl = reader.GetStringSafe("learn_more_url", "#"),
                                DisplayOrder = reader.GetInt32Safe("display_order", 1),
                                IsActive = reader.GetBooleanSafe("is_active", true)
                            });
                        }
                    }
                }
            }
            return Ok(plans);
        }

        // GET /api/plans/features?planType=POS&tierName=Lite
        [HttpGet("features")]
        public async Task<IActionResult> GetPlanFeatures([FromQuery] string? planType = null, [FromQuery] string? tierName = null)
        {
            var features = new List<PlanFeature>();
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_GetPlanFeatures", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_plan_type", (object?)planType ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("p_tier_name", (object?)tierName ?? DBNull.Value);

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            features.Add(new PlanFeature
                            {
                                FeatureId = reader.GetInt32Safe("feature_id"),
                                PlanId = reader.GetNullableInt32Safe("plan_id"),
                                PlanType = reader.GetStringSafe("plan_type"),
                                TierName = reader.GetStringSafe("tier_name"),
                                CategoryName = reader.GetNullableStringSafe("category_name"),
                                FeatureName = reader.GetStringSafe("feature_name"),
                                FeatureValue = reader.GetDecimalSafe("feature_value"),
                                DisplayOrder = reader.GetInt32Safe("display_order", 1),
                                IsHighlighted = reader.GetBooleanSafe("is_highlighted", false)
                            });
                        }
                    }
                }
            }
            return Ok(features);
        }

        // GET /api/plans/growth/features
        [HttpGet("growth/features")]
        public async Task<IActionResult> GetGrowthPlanFeatures()
        {
            var features = new List<PlanFeature>();
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
                            features.Add(new PlanFeature
                            {
                                FeatureId = reader.GetInt32Safe("feature_id"),
                                PlanId = reader.GetNullableInt32Safe("plan_id"),
                                PlanType = reader.GetStringSafe("plan_type", "Growth"),
                                TierName = reader.GetStringSafe("tier_name", "Growth"),
                                CategoryName = reader.GetNullableStringSafe("category_name"),
                                FeatureName = reader.GetStringSafe("feature_name"),
                                FeatureValue = reader.GetDecimalSafe("feature_value"),
                                DisplayOrder = reader.GetInt32Safe("display_order", 1),
                                IsHighlighted = reader.GetBooleanSafe("is_highlighted", false)
                            });
                        }
                    }
                }
            }
            return Ok(features);
        }

        // GET /api/plans/settings?pageName=Subscription
        [HttpGet("settings")]
        public async Task<IActionResult> GetPageSettings([FromQuery] string pageName = "Subscription")
        {
            var settings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_GetPageSettings", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_page_name", pageName);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var key = reader.GetStringSafe("setting_key");
                            var val = reader.GetStringSafe("setting_value");
                            if (!string.IsNullOrEmpty(key))
                            {
                                settings[key] = val;
                            }
                        }
                    }
                }
            }
            return Ok(settings);
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
                                TierName = reader.GetStringSafe("tier_name"),
                                BillingCycle = reader.GetStringSafe("billing_cycle"),
                                Price = reader.GetDecimalSafe("price"),
                                MonthlyPrice = reader.GetDecimalSafe("monthly_price"),
                                YearlyPrice = reader.GetDecimalSafe("yearly_price"),
                                OneTimePrice = reader.GetDecimalSafe("one_time_price"),
                                OriginalPrice = reader.GetDecimalSafe("original_price"),
                                TrialDays = reader.GetInt32Safe("trial_days", 14),
                                BadgeText = reader.GetNullableStringSafe("badge_text"),
                                Tagline = reader.GetNullableStringSafe("tagline"),
                                Description = reader.GetStringSafe("description"),
                                CtaText = reader.GetStringSafe("cta_text", "Start 14 Day Free Trial"),
                                LearnMoreUrl = reader.GetStringSafe("learn_more_url", "#"),
                                DisplayOrder = reader.GetInt32Safe("display_order", 1),
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

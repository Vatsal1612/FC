using System.Data;
using FC_POS_API.Models;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace FC_POS_API.Controllers
{
    [ApiController]
    [Route("api/addons")]
    public class AddOnsController : ControllerBase
    {
        private readonly string _connectionString;

        public AddOnsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? configuration.GetConnectionString("DbConnectionString") 
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        // GET /api/addons/monthly
        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthlyAddOns()
        {
            var addOns = await FetchAddOnsFromProcedure("sp_GetMonthlyAddOns");
            return Ok(addOns);
        }

        // GET /api/addons/yearly
        [HttpGet("yearly")]
        public async Task<IActionResult> GetYearlyAddOns()
        {
            var addOns = await FetchAddOnsFromProcedure("sp_GetYearlyAddOns");
            return Ok(addOns);
        }

        // GET /api/addons/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetAddOnById(int id)
        {
            AddOn? addOn = null;
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_GetAddOnById", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_addon_id", id);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            addOn = new AddOn
                            {
                                AddOnId = reader.GetInt32Safe("addon_id"),
                                AddOnName = reader.GetStringSafe("addon_name"),
                                Description = reader.GetStringSafe("description"),
                                MonthlyPrice = reader.GetDecimalSafe("monthly_price"),
                                YearlyPrice = reader.GetDecimalSafe("yearly_price"),
                                OneTimePrice = reader.GetDecimalSafe("one_time_price"),
                                QuantityEnabled = reader.GetBooleanSafe("quantity_enabled"),
                                GrowthIncluded = reader.GetBooleanSafe("growth_included"),
                                ImagePath = reader.GetStringSafe("image_path")
                            };
                        }
                    }
                }
            }

            if (addOn == null)
            {
                return NotFound(new { message = $"Add-on with ID {id} not found." });
            }

            return Ok(addOn);
        }

        // GET /api/addons/options/{id}
        [HttpGet("options/{id:int}")]
        public async Task<IActionResult> GetAddOnOptions(int id, [FromQuery] string? billingCycle = null)
        {
            var options = new List<AddOnOption>();
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand("sp_GetAddOnOptions", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("p_addon_id", id);
                    cmd.Parameters.AddWithValue("p_billing_cycle", billingCycle ?? string.Empty);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            options.Add(new AddOnOption
                            {
                                OptionId = reader.GetInt32Safe("option_id"),
                                AddOnId = reader.GetInt32Safe("addon_id"),
                                OptionName = reader.GetStringSafe("option_name"),
                                BillingCycle = reader.GetStringSafe("billing_cycle"),
                                Price = reader.GetDecimalSafe("price"),
                                IsDefault = reader.GetBooleanSafe("is_default")
                            });
                        }
                    }
                }
            }
            return Ok(options);
        }

        private async Task<List<AddOn>> FetchAddOnsFromProcedure(string procedureName)
        {
            var addOns = new List<AddOn>();
            using (var conn = new MySqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var cmd = new MySqlCommand(procedureName, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            addOns.Add(new AddOn
                            {
                                AddOnId = reader.GetInt32Safe("addon_id"),
                                AddOnName = reader.GetStringSafe("addon_name"),
                                Description = reader.GetStringSafe("description"),
                                MonthlyPrice = reader.GetDecimalSafe("monthly_price"),
                                YearlyPrice = reader.GetDecimalSafe("yearly_price"),
                                OneTimePrice = reader.GetDecimalSafe("one_time_price"),
                                QuantityEnabled = reader.GetBooleanSafe("quantity_enabled"),
                                GrowthIncluded = reader.GetBooleanSafe("growth_included"),
                                ImagePath = reader.GetStringSafe("image_path")
                            });
                        }
                    }
                }
            }
            return addOns;
        }
    }
}

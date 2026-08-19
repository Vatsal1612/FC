namespace FC_POS_API.Models
{
    public class AddOn
    {
        public int AddOnId { get; set; }
        public string AddOnName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal MonthlyPrice { get; set; }
        public decimal YearlyPrice { get; set; }
        public decimal OneTimePrice { get; set; }
        public bool QuantityEnabled { get; set; }
        public bool GrowthIncluded { get; set; }
        public string ImagePath { get; set; } = string.Empty;
    }
}
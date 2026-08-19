namespace FC_POS.Models
{
    public class AddOnViewModel
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
        public List<AddOnOptionViewModel> Options { get; set; } = new();
    }

    public class AddOnOptionViewModel
    {
        public int OptionId { get; set; }
        public int AddOnId { get; set; }
        public string OptionName { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsDefault { get; set; }
    }
}

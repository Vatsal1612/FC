namespace FC_POS_API.Models
{
    public class AddOnOption
    {
        public int OptionId { get; set; }
        public int AddOnId { get; set; }
        public string OptionName { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsDefault { get; set; }
    }
}

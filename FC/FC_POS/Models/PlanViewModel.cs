namespace FC_POS.Models
{
    public class PlanViewModel
    {
        public int PlanId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string PlanType { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int TrialDays { get; set; } = 14;
        public string Description { get; set; } = string.Empty;
    }

    public class GrowthFeatureViewModel
    {
        public int FeatureId { get; set; }
        public int PlanId { get; set; }
        public string FeatureName { get; set; } = string.Empty;
        public decimal FeatureValue { get; set; }
    }
}

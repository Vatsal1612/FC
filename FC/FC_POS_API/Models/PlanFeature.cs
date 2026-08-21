namespace FC_POS_API.Models
{
    public class PlanFeature
    {
        public int FeatureId { get; set; }
        public int? PlanId { get; set; }
        public string PlanType { get; set; } = string.Empty;
        public string TierName { get; set; } = string.Empty;
        public string? CategoryName { get; set; }
        public string FeatureName { get; set; } = string.Empty;
        public decimal FeatureValue { get; set; }
        public int DisplayOrder { get; set; } = 1;
        public bool IsHighlighted { get; set; } = false;
    }
}

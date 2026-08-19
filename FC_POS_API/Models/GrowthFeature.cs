namespace FC_POS_API.Models
{
    public class GrowthFeature
    {
        public int FeatureId { get; set; }
        public int PlanId { get; set; }
        public string FeatureName { get; set; } = string.Empty;
        public decimal FeatureValue { get; set; }
    }
}

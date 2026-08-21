namespace FC_POS_API.Models
{
    public class SubscriptionPlan
    {
        public int PlanId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string PlanType { get; set; } = string.Empty;
        public string TierName { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal YearlyPrice { get; set; }
        public decimal OneTimePrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public int TrialDays { get; set; } = 14;
        public string? BadgeText { get; set; }
        public string? Tagline { get; set; }
        public string Description { get; set; } = string.Empty;
        public string CtaText { get; set; } = "Start 14 Day Free Trial";
        public string LearnMoreUrl { get; set; } = "#";
        public int DisplayOrder { get; set; } = 1;
        public bool IsActive { get; set; } = true;
    }
}
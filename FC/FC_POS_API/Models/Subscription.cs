namespace FC_POS_API.Models
{
    public class Subscription
    {
        public int SubscriptionId { get; set; }
        public int RestaurantId { get; set; }
        public int PlanId { get; set; }
        public decimal Amount { get; set; }
        public DateTime TrialEndDate { get; set; }
        public DateTime NextBillingDate { get; set; }
        public string Status { get; set; } = "Trial";
        public DateTime CreatedAt { get; set; }
        public string? RestaurantName { get; set; }
        public string? RestaurantEmail { get; set; }
        public string? PlanName { get; set; }
    }

    public class CreateSubscriptionDto
    {
        public int RestaurantId { get; set; }
        public int PlanId { get; set; }
        public decimal Amount { get; set; }
        public string? RestaurantName { get; set; }
        public string? RestaurantEmail { get; set; }
        public string? RestaurantPhone { get; set; }
        public string? RestaurantAddress { get; set; }
    }
}

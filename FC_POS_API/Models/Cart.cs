namespace FC_POS_API.Models
{
    public class Cart
    {
        public int CartId { get; set; }
        public int RestaurantId { get; set; }
        public int PlanId { get; set; }
        public string BillingCycle { get; set; } = "Monthly";
        public decimal TotalAmount { get; set; }
        public string? PlanName { get; set; }
        public decimal PlanPrice { get; set; }
        public List<CartItem> Items { get; set; } = new();
    }

    public class CreateCartDto
    {
        public int RestaurantId { get; set; } = 1;
        public int PlanId { get; set; }
        public string BillingCycle { get; set; } = "Monthly";
    }
}

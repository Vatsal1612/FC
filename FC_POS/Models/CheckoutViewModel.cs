namespace FC_POS.Models
{
    public class CheckoutViewModel
    {
        public int CartId { get; set; }
        public int RestaurantId { get; set; } = 1;
        public int PlanId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = "Monthly";
        public decimal BasePlanPrice { get; set; }
        public decimal AddOnsTotalPrice { get; set; }
        public decimal GrandTotal { get; set; }
        public string RestaurantName { get; set; } = "Demo Bistro";
        public string RestaurantEmail { get; set; } = "demo@bistro.com";
        public string RestaurantPhone { get; set; } = "+1234567890";
    }
}

namespace FC_POS.Models
{
    public class CartViewModel
    {
        public int CartId { get; set; }
        public int RestaurantId { get; set; }
        public int PlanId { get; set; }
        public string BillingCycle { get; set; } = "Monthly";
        public decimal TotalAmount { get; set; }
        public string? PlanName { get; set; }
        public decimal PlanPrice { get; set; }
        public List<CartItemViewModel> Items { get; set; } = new();
    }

    public class CartItemViewModel
    {
        public int ItemId { get; set; }
        public int CartId { get; set; }
        public int? AddOnId { get; set; }
        public int? OptionId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal Price { get; set; }
        public string? AddOnName { get; set; }
        public string? OptionName { get; set; }
        public bool QuantityEnabled { get; set; }
    }
}

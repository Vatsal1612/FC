namespace FC_POS_API.Models
{
    public class CartItem
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

    public class AddCartItemDto
    {
        public int CartId { get; set; }
        public int AddOnId { get; set; }
        public int? OptionId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal Price { get; set; }
    }

    public class UpdateCartItemDto
    {
        public int ItemId { get; set; }
        public int CartId { get; set; }
        public int Quantity { get; set; }
    }
}

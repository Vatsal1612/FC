namespace FC_POS_API.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public int SubscriptionId { get; set; }
        public string? RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePaymentDto
    {
        public int SubscriptionId { get; set; }
        public decimal Amount { get; set; }
        public string? RazorpayOrderId { get; set; }
    }

    public class VerifyPaymentDto
    {
        public int PaymentId { get; set; }
        public int SubscriptionId { get; set; }
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string Status { get; set; } = "Success";
    }
}

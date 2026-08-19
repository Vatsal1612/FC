using Microsoft.AspNetCore.Mvc;

namespace FC_POS.Controllers
{
    public class SubscriptionController : Controller
    {
        // GET: /Subscription or /Subscription/Index
        public IActionResult Index()
        {
            return View();
        }

        // GET: /Subscription/PosAddOns
        public IActionResult PosAddOns(int? planId)
        {
            ViewBag.PlanId = planId ?? 1; // Default to POS Lite (1)
            return View();
        }

        // GET: /Subscription/GrowthAddOns
        public IActionResult GrowthAddOns(int? planId)
        {
            ViewBag.PlanId = planId ?? 2; // Default to Growth Plan (2)
            return View();
        }

        // GET: /Subscription/Success
        public IActionResult Success(int? subscriptionId)
        {
            ViewBag.SubscriptionId = subscriptionId ?? 0;
            return View();
        }

        // GET: /Subscription/Failed
        public IActionResult Failed(int? subscriptionId, string? error)
        {
            ViewBag.SubscriptionId = subscriptionId ?? 0;
            ViewBag.ErrorMessage = error ?? "Transaction failed or was cancelled.";
            return View();
        }
    }
}

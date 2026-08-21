namespace FC_POS_API.Models
{
    public class PageSetting
    {
        public int SettingId { get; set; }
        public string PageName { get; set; } = string.Empty;
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
    }
}

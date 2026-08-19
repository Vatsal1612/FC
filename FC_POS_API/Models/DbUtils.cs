using System.Data;

namespace FC_POS_API.Models
{
    public static class DbUtils
    {
        public static bool HasColumn(this IDataRecord dr, string columnName)
        {
            for (int i = 0; i < dr.FieldCount; i++)
            {
                if (dr.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }

        public static string GetStringSafe(this IDataRecord dr, string columnName, string defaultValue = "")
        {
            if (!dr.HasColumn(columnName) || dr[columnName] == DBNull.Value)
                return defaultValue;
            return dr[columnName].ToString() ?? defaultValue;
        }

        public static int GetInt32Safe(this IDataRecord dr, string columnName, int defaultValue = 0)
        {
            if (!dr.HasColumn(columnName) || dr[columnName] == DBNull.Value)
                return defaultValue;
            return Convert.ToInt32(dr[columnName]);
        }

        public static decimal GetDecimalSafe(this IDataRecord dr, string columnName, decimal defaultValue = 0m)
        {
            if (!dr.HasColumn(columnName) || dr[columnName] == DBNull.Value)
                return defaultValue;
            return Convert.ToDecimal(dr[columnName]);
        }

        public static bool GetBooleanSafe(this IDataRecord dr, string columnName, bool defaultValue = false)
        {
            if (!dr.HasColumn(columnName) || dr[columnName] == DBNull.Value)
                return defaultValue;
            return Convert.ToBoolean(dr[columnName]);
        }

        public static DateTime GetDateTimeSafe(this IDataRecord dr, string columnName)
        {
            if (!dr.HasColumn(columnName) || dr[columnName] == DBNull.Value)
                return DateTime.UtcNow;
            return Convert.ToDateTime(dr[columnName]);
        }

        public static int? GetNullableInt32Safe(this IDataRecord dr, string columnName)
        {
            if (!dr.HasColumn(columnName) || dr[columnName] == DBNull.Value)
                return null;
            return Convert.ToInt32(dr[columnName]);
        }

        public static string? GetNullableStringSafe(this IDataRecord dr, string columnName)
        {
            if (!dr.HasColumn(columnName) || dr[columnName] == DBNull.Value)
                return null;
            return dr[columnName].ToString();
        }
    }
}

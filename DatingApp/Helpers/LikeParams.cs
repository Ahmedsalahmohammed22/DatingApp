namespace DatingApp.Helpers
{
    public class LikeParams : PaginationParams
    {
        public int userId { get; set; }
        public string Predicate { get; set; }
    }
}

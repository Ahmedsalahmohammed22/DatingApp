using Microsoft.EntityFrameworkCore;

namespace DatingApp.Helpers
{
    public class PagedList<T> : List<T>
    {
        public PagedList(IEnumerable<T> items ,  int pageNumber, int count, int pageSize)
        {
            CurrentPage = pageNumber;
            TotalCount = count;
            
            PageSize = pageSize;
            TotalPages = (int) Math.Ceiling(count / (double) pageSize);
            AddRange(items);
        }

        public int CurrentPage { get; set; }
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }

        public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source , int pageNumber , int pageSize)
        {
            var count = source.Count();
            var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PagedList<T>(items , pageNumber, count, pageSize);
        }

    }
}

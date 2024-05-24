using DatingApp.DTOs;
using DatingApp.Extensions;
using DatingApp.Helpers;
using DatingApp.Interfaces;
using DatingApp.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.Data
{
    public class LikesRepository : ILikesRepository
    {
        private readonly AppDbContext _context;

        public LikesRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<UserLike> GetUserLike(int sourceUserId, int targetUserId)
        {
           return await _context.Likes.FindAsync(sourceUserId , targetUserId);
        }

        public async Task<PagedList<LikeDto>> GetUserLikes(LikeParams likeParams)
        {
            var users = _context.Users.OrderBy(u => u.UserName).AsQueryable();
            var likes = _context.Likes.AsQueryable();

            if(likeParams.Predicate == "liked")
            {
                likes = likes.Where(like => like.SourceUserId == likeParams.userId);
                users = likes.Select(like => like.TargetUser);
            }
            if(likeParams.Predicate == "likedBy")
            {
                likes = likes.Where(like => like.TargetUserId == likeParams.userId);
                users = likes.Select(like => like.SourceUser);
            }
            var likedUsers = users.Select(users => new LikeDto
            {
                Name = users.UserName,
                KnownAs = users.KnownAs,
                Age = users.DateOfBirth.CalculateAge(),
                PhotoUrl = users.Photos.FirstOrDefault(p => p.IsMain).Url,
                City = users.City,
                Id = users.Id
            });
            return await PagedList<LikeDto>.CreateAsync(likedUsers, likeParams.PageNumber, likeParams.PageSize);
        }

        public async Task<AppUser> GetUserWithLikes(int userId)
        {
            return await _context.Users
                .Include(x => x.likedUsers)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
}

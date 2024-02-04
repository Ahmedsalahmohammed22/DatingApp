using AutoMapper;
using DatingApp.Data;
using DatingApp.DTOs;
using DatingApp.Interfaces;
using DatingApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace DatingApp.Controllers
{

    public class AccountsController : BaseApiController
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public AccountsController(AppDbContext context , ITokenService tokenService , IUserRepository userRepository , IMapper mapper)
        {
            _context = context;
            _tokenService = tokenService;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        [HttpPost("register")] // POST: api/Accounts/register
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if(await UserExists(registerDto.Name)) return BadRequest("Username is taken" + registerDto.Name);
            var user = _mapper.Map<AppUser>(registerDto);

            using var hmac = new HMACSHA512();
            user.Name = registerDto.Name.ToLower();
            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
            user.PasswordSalt = hmac.Key;
            
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return Ok(new UserDto
            {
                UserName = user.Name,
                Token = _tokenService.CreateToken(user),
                KnownAs = user.KnownAs
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _context.Users.Include(p => p.Photos).SingleOrDefaultAsync(x => x.Name == loginDto.UserName);
            if (user == null) return Unauthorized("Invalid Name");
            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));
            for (int i =0; i <  computedHash.Length; i++) 
            {
                if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
            }
            return Ok(new UserDto
            {
                UserName = user.Name,
                Token = _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
                KnownAs = user.KnownAs
            });

        }

        private async Task<bool> UserExists(string username)
        {
            return await _context.Users.AnyAsync(x => x.Name == username.ToLower());
        }
    }
}

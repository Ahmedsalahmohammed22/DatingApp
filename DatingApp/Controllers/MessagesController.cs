using AutoMapper;
using DatingApp.DTOs;
using DatingApp.Extensions;
using DatingApp.Helpers;
using DatingApp.Interfaces;
using DatingApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.Controllers
{
    public class MessagesController : BaseApiController
    {
        private readonly IUserRepository _userRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IMapper _mapper;

        public MessagesController(IUserRepository userRepository , IMessageRepository messageRepository , IMapper mapper) 
        {
            _userRepository = userRepository;
            _messageRepository = messageRepository;
            _mapper = mapper;
        }
        [HttpPost]
        public async Task<IActionResult> createMessage(CreateMessageDto createMessageDto)
        {
            var userName = User.GetUsername();
            if (userName == createMessageDto.RecipientUsername.ToLower())
                return BadRequest("You cannot send messages to yourself");
            var sender = await _userRepository.GetUserByUsernameAsync(userName);
            var recipient = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);
            if(recipient == null) 
                return NotFound();
            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUsername = sender.UserName,
                RecipientUsername = recipient.UserName,
                content = createMessageDto.content,
            };
            _messageRepository.AddMessage(message);
            if(await _messageRepository.SaveAllAsync()) return Ok(_mapper.Map<MessageDto>(message));
            return BadRequest("Failed to send message");
        }
        [HttpGet]
        public async Task<ActionResult<PagedList<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
        {
            messageParams.Username = User.GetUsername();
            var messages = await _messageRepository.GetMessagesForUser(messageParams);
            Response.AddPaginationHeader(new PaginationHeader(messages.CurrentPage, messages.PageSize , messages.TotalCount , messages.TotalPages));
            return messages;
        }
        [HttpGet("thread/{username}")]
        public async Task<IActionResult> GetMessagesThread(string username)
        {
            var currentUserName = User.GetUsername();
            return Ok(await _messageRepository.GetMessageThread(currentUserName, username));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var username = User.GetUsername();
            var message = await _messageRepository.GetMessage(id);
            if (message.SenderUsername != username && message.RecipientUsername != username) return Unauthorized();
            if(message.SenderUsername ==  username) message.SenderDeleted = true;
            if (message.RecipientUsername == username) message.RecipientDeleted = true;
            if(message.RecipientDeleted && message.SenderDeleted)
            {
                _messageRepository.DeleteMessage(message);
            }
            if (await _messageRepository.SaveAllAsync()) return Ok();
            return BadRequest("Problem deleting the message");

        }
    }
}

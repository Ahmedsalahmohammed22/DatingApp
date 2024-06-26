﻿using System.ComponentModel.DataAnnotations;

namespace DatingApp.Models
{
    public class Group
    {
        public Group()
        {
            
        }
        public Group(string name)
        {
            Name = name;
        }

        [Key]
        public string Name { get; set; }
        public ICollection<Connection> connections { get; set; } = new List<Connection>();
    }
}

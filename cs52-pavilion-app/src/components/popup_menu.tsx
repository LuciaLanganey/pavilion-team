export type PopupMenuProps = {
    image: string;
    profile: {
        name: string;
        role: string;
        location: string;
        bio: string;
    };
    contact: {
        email: string;
        phoneNumber: string;
        website: string;
    };
    facts: {
        responseTime: string;
        preferences: string;
    };
};

function PopupMenu({image, profile, contact, facts}: PopupMenuProps) {
    
    const handleClick = () => {
        console.log("Chat with this Person on Pavilion.");
    }

    return (
        <div>
            <h1>Popup</h1>

            {/* Build the background container for the menu popup. */}
            <div>
                {/* image */}
                <img src={image} alt="image of sales representative"/>
                {/* name of rep */}
                <h1>{profile.name}</h1>
                {/* role of rep */}
                <h1>{profile.role}</h1>
                {/* location of rep */}
                <h1>{profile.location}</h1>
                {/* biography of rep */}
                <p>{profile.bio}</p>
                {/* contact of rep */}
                <div>
                    {/* email of rep */}
                        <h1>{contact.email}</h1>
                    {/* phone number of rep */}
                        <h1>{contact.phoneNumber}</h1>
                    {/* website of rep */}
                        <a href={contact.website}>{contact.website}</a>
                        </div>
                {/* facts of rep */}
                <div>
                    {/* response time of rep */}
                        <h1>{facts.responseTime}</h1>
                    {/* preferences of rep */}
                        <h1>{facts.preferences}</h1>
                </div>

                {/* Button to chat */}
                <button onClick={handleClick}>Chat with this Person on Pavilion</button>
            </div>
        </div>
    );
}

export default PopupMenu;
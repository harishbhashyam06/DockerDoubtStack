import React, { useRef, useEffect } from 'react';

export default function DropdownMenu({ handleProfileButtonClick, handleLogout, isMenuOpened , setMenuOpen}) {
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && event.target.nodeName != "IMG") {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div>
      {isMenuOpened && (
        <div
          ref={menuRef}
          style = {{
            position: 'absolute',
            top: '60px',
            right: '30px',
            color: 'black',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            width: '150px',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={handleProfileButtonClick} id='#profile'>
            Profile
          </div>
          <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={handleLogout} id='#logout'>
            Logout
          </div>
        </div>
      )}
    </div>
  );
}

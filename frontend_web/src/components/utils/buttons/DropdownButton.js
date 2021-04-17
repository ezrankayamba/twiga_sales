import React, { useEffect, useRef, useState } from 'react';
import MatIcon from '../icons/MatIcon';

function DropdownButton({ label, options, handleOption }) {
    const [show, setShow] = useState(false)
    const btnRef = useRef(null);
    const handleClickOutside = (event) => {
        if (btnRef.current && !btnRef.current.contains(event.target)) {
            setShow(false);
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
    return (
        <div className="btn-dropdown">
            <button ref={btnRef} className="btn btn-sm btn-primary" onClick={() => setShow(!show)}><MatIcon name="post_add" />{label}</button>
            <ul>
                {show && options.map(o => <li key={o.id} onClick={() => handleOption && handleOption(o)}>{o.name}</li>)}
            </ul>
        </div>
    );
}

export default DropdownButton;
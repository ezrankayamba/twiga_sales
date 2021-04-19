import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import React from "react"
export const openConfirmDialog = ({ title, message, buttons }) => {
    confirmAlert(
        {
            customUI: ({ onClose }) => <div className="confirm-dialog">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="buttons">
                    {buttons.map(btn => <button key={btn.label} className={`btn btn-sm ${btn.cls}`} onClick={btn.handler ? () => {
                        btn.handler()
                        onClose()
                    } : onClose}>{btn.label}</button>)}
                </div>
            </div>
        }
    );
}
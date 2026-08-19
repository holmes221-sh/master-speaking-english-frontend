import ReactDom from 'react-dom'
export function FeedBack({ onClose, children }) {
    return ReactDom.createPortal(
        <div className="feedback-container">
            <button
                className="feedback-closing-button"
                onClick={onClose}
            />
            <div className="feedback-content">
                {children}
            </div>
        </div>,
        document.getElementById("feedback-root")
    );
}
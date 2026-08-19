import ReactDom from 'react-dom'
export function LoadingBar({ small = false }) {
    if (!small) {
        return ReactDom.createPortal(
            <div className="loading-circle">
                <span></span>
                <span></span>
                <span></span>
            </div>,
            document.getElementById("loading-root")
        );
    }
    return (<div className='small-loading-circle'>
        <span></span>
        <span></span>
        <span></span>
    </div>)
}


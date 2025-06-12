
const Button = ({ content, onClick }) => {
    return (
        <button onClick={onClick} className="bg-[#23c8ac] text-white px-3 py-1 text-sm rounded transition hover:bg-[#1fb39a]">
            {content}
        </button>
    )
}

export default Button
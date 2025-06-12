const ButtonIcon = ({ icon, color = "primary", eventClick }) => {

    const colors = {
        prmary: "bg-[#23c8ac] hover:bg-[#1faf97]",
        secondary: "bg-[#ffa600] hover:bg-[#e09200]"
    }

    return (
        <button
            onClick={eventClick}
            className={
                `${color === "primary" ? colors.prmary : colors.secondary} 
            w-full h-[70px] rounded-lg grid place-content-center text-white transition`
            }
        >
            {icon}
        </button>
    )
}

export default ButtonIcon
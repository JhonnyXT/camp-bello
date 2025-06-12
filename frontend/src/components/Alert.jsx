import { useEffect, useState } from "react";


const Alert = ({ type, msg = "" }) => {

    const [timing, setTimimg] = useState(true);


    const alertType = (type = "success") => {
        return type === "success" ?
            {
                icon:
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-check" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                    </svg>,
                bg: "bg-green-700"
            } : {
                icon:
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-exclamation-circle" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 16v.01"></path>
                    </svg>,
                bg: "bg-red-700"
            }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimimg(false);
        }, 5000);

        return () => clearTimeout(timer)
    }, []);

    return (
        <>
            {
                timing &&
                <div className={`${alertType(type).bg} w-full px-4 py-2 rounded text-white flex justify-start items-center gap-2`}>
                    {alertType(type).icon}
                    <p>{msg}</p>
                </div>
            }
        </>
    )
}

export default Alert
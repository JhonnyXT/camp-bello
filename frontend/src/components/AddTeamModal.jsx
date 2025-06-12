import axios from "axios";
import { useRef, useState } from "react";
import Alert from "./Alert";
import Input from "./ui/Input";
import Button from "./ui/Button";

const AddTeamModal = ({ setModal }) => {
    const colorRef = useRef(null);
    const [amountFormat, setAmountFormat] = useState("0");
    const [amount, setAmount] = useState("");
    const [teamName, setTeamName] = useState("");
    const [color, setColor] = useState("#FFFFFF");
    const [alert, setAlert] = useState({
        type: "",
        msg: ""
    });

    const handleInputChange = (e) => {
        setAmount(e.target.value);
        setAmountFormat(Number(e.target.value).toLocaleString());
    };

    const clearFields = () => {
        setAmount("");
        setTeamName("");
        setColor("#FFFFFF");
    };

    const handleSubmit = async () => {
        setAmountFormat("0");
        setAlert({
            type: "",
            msg: ""
        });
        
        try {
            await axios.post("http://localhost:8080/api/teams", {
                name: teamName,
                cash: amount,
                color: color
            });
            
            setAlert({
                msg: "Equipo creado exitosamente",
                type: "success"
            });
            clearFields();
        } catch (error) {
            setAlert({
                msg: "Hubo un error al crear el equipo",
                type: "error"
            });
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {alert.msg && <Alert type={alert.type} msg={alert.msg} />}
            
            <div className="space-y-4">
                <Input
                    label="Nombre del equipo"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="Ej: Los Manitos"
                    autoComplete="off"
                />

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Color del equipo
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            ref={colorRef}
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            type="color"
                            className="h-10 w-20 rounded-lg cursor-pointer"
                        />
                        <div 
                            className="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                        />
                    </div>
                </div>

                <Input
                    label={`Puntaje inicial ${amountFormat ? `(${amountFormat})` : ''}`}
                    value={amount}
                    onChange={handleInputChange}
                    placeholder="0"
                    autoComplete="off"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <Button
                    variant="ghost"
                    onClick={() => setModal(false)}
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                >
                    Agregar Equipo
                </Button>
            </div>
        </div>
    );
};

export default AddTeamModal;
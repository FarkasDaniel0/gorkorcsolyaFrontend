import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import background from '../images/image.png'

export default function Kepteszt() {
  const navigate = useNavigate();

  
  

  return (
        <div 
           
          style={{ 
            backgroundImage:`url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        > 

        </div>
      );
    }


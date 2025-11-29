import { useLocation, useNavigate } from "react-router-dom";
import ImageEditingCanvas from "@/components/dashboard/ImageEditingCanvas";

const Edit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const image = location.state?.imageUrl || undefined;

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = () => {
    navigate("/create");
  };

  return (
    <ImageEditingCanvas
      image={image}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
};

export default Edit;

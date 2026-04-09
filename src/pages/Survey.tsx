import { useNavigate } from "react-router-dom";
import AddictionSurvey, { type SurveyAnswers } from "@/components/AddictionSurvey";

const SurveyPage = () => {
  const navigate = useNavigate();

  const handleComplete = (answers: SurveyAnswers) => {
    localStorage.setItem("myaddiction_survey", JSON.stringify(answers));
    navigate("/app");
  };

  return (
    <AddictionSurvey
      onComplete={handleComplete}
      onBack={() => navigate("/")}
    />
  );
};

export default SurveyPage;

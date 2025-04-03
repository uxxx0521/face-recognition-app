import FaceDetectionFeed from "./components/FaceDetectionFeed/FaceDetectionFeed"
import Header from "./components/Header/Header";
import Instructions from "./components/Instructions/Instructions";
import UploadFile from "./components/FileUpload/UploadFIle";
import UploadHeader from "./components/UploadHeader/UploadHeader";
import './App.css'

function App() {


  return (
    <>
      <div className="heroBackground">
        <Header />
        <Instructions />
        <FaceDetectionFeed />
      </div>
      <UploadHeader />
      <UploadFile />

    </>
  )
}

export default App

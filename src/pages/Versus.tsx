import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import VersusComponent from "@/components/versus/Versus";

const Versus = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-0">
          <VersusComponent />
        </main>
      </div>
    </div>
  );
};

export default Versus;

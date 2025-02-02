import React, {
  createContext,
  memo,
  useContext,
  useState,
  useEffect,
} from "react";
import { Filter, UserType } from "@/app/types";
import { ViewMode } from "gantt-task-react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { useSigner } from "wagmi";
import { Signer } from "ethers";
import { DIDSession } from "did-session";

interface GlobalContextType {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (isSidebarExpanded: boolean) => void;
  isProfilePanelExpanded: boolean;
  setIsProfilePanelExpanded: (isProfilePanelExpanded: boolean) => void;
  connectedUser: string;
  connectUser: (userId: string) => void;
  disconnectUser: () => void;
  quickProfileUser: string;
  openQuickProfile: (userId: string) => void;
  viewName: string;
  setViewName: React.Dispatch<React.SetStateAction<string>>;
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
  notifseen: boolean;
  setNotifSeen: React.Dispatch<React.SetStateAction<boolean>>;
  currentFilter: Filter;
  setCurrentFilter: React.Dispatch<React.SetStateAction<Filter>>;
  calendarView: ViewMode;
  setCalendarView: React.Dispatch<React.SetStateAction<ViewMode>>;
  socket: Socket;
  setSocket: React.Dispatch<React.SetStateAction<Socket>>;
  groupBy: "Folder" | "Type";
  setGroupBy: React.Dispatch<React.SetStateAction<"Folder" | "Type">>;
  userData: UserType;
  setUserData: React.Dispatch<React.SetStateAction<UserType>>;
  profileLoading: boolean;
  setProfileLoading: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: number;
  setToggle: (toggle: number) => void;
  signer: Signer;
  ceramicSession: DIDSession | null;
  setCeramicSession: React.Dispatch<React.SetStateAction<DIDSession | null>>;
}

const useProviderGlobalContext = () => {
  const router = useRouter();
  const { data: contractSigner, isLoading: signerLoading } = useSigner();
  const { project: pId } = router.query;

  const [signer, setSigner] = useState<Signer>(contractSigner as Signer);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [connectedUser, setConnectedUser] = useState("");

  const [isProfilePanelExpanded, setIsProfilePanelExpanded] = useState(false);
  const [quickProfileUser, setQuickProfileUser] = useState("");

  const [groupBy, setGroupBy] = useState<"Folder" | "Type">("Folder");
  const [toggle, setToggle] = useState<number>(0);

  const [viewName, setViewName] = useState("" as string);
  const [calendarView, setCalendarView] = useState<ViewMode>(ViewMode.Day);

  const [tab, setTab] = useState("Work");
  const [notifseen, setNotifSeen] = useState(false);

  const [currentFilter, setCurrentFilter] = useState({} as Filter);

  const [socket, setSocket] = useState<Socket>({} as Socket);

  const [userData, setUserData] = useState({} as UserType);
  const [profileLoading, setProfileLoading] = useState(false);

  const [ceramicSession, setCeramicSession] = useState<DIDSession | null>(null);

  function connectUser(userId: string) {
    setConnectedUser(userId);
  }
  const disconnectUser = () => {
    setConnectedUser("");
  };

  const openQuickProfile = (userId: string) => {
    setIsProfilePanelExpanded(true);
    setQuickProfileUser(userId);
  };

  useEffect(() => {
    const filter = localStorage.getItem(pId as string);
    if (filter == null) {
      setCurrentFilter({} as Filter);
    } else {
      setCurrentFilter(JSON.parse(filter));
    }
  }, [pId]);

  useEffect(() => {
    const socket = io(process.env.API_HOST || "");
    socket.on("connect", function () {
      setSocket(socket);
    });

    socket.on("disconnect", function () {
      console.log("Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!signerLoading) setSigner(contractSigner as Signer);
  }, [connectedUser, contractSigner, signerLoading]);

  useEffect(() => {
    if (socket.connected && connectedUser) {
      socket.emit("join", connectedUser);
    }
  }, [connectedUser, socket]);

  return {
    isSidebarExpanded,
    setIsSidebarExpanded,
    connectedUser,
    connectUser,
    disconnectUser,
    isProfilePanelExpanded,
    setIsProfilePanelExpanded,
    quickProfileUser,
    openQuickProfile,
    viewName,
    setViewName,
    calendarView,
    setCalendarView,
    tab,
    setTab,
    toggle,
    setToggle,
    notifseen,
    setNotifSeen,
    currentFilter,
    setCurrentFilter,
    groupBy,
    setGroupBy,
    socket,
    setSocket,
    userData,
    setUserData,
    profileLoading,
    setProfileLoading,
    signer,
    ceramicSession,
    setCeramicSession,
  };
};

const GlobalContext = createContext<GlobalContextType>({} as GlobalContextType);

export const useGlobal = () => useContext(GlobalContext);

function GlobalContextProvider({ children }: { children: React.ReactNode }) {
  const context = useProviderGlobalContext();

  return (
    <GlobalContext.Provider value={context}>{children}</GlobalContext.Provider>
  );
}

export default memo(GlobalContextProvider);

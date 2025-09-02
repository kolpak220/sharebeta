import React from "react";
import termsData from "../assets/privacyPolicy.json";
import styles from "./TermsOfService.module.css";
import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TermsItem {
  id: string;
  title?: string;
  text: string;
}

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const doesAnyHistoryEntryExist = location.key !== "default";

  return (
    <>
      <div className={styles.termsContainer}>
        <div className="absolute flex h-20 bg-black z-10 w-full top-0 left-0 items-center border-b border-b-[#333] max-w-[700px]">
          <button
            onClick={() => {
              if (doesAnyHistoryEntryExist) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="text-[#666] ml-5"
            aria-label="Close"
          >
            <X size={30} />
          </button>
        </div>

        <div className="h-20"></div>
        {termsData.sections.map((section) => (
          <div key={section.id} className={styles.termsSection}>
            <h1>{section.title}</h1>
            {section.description && (
              <p>
                <em>{section.description}</em>
              </p>
            )}
            <ul>
              {section.items.map((item: TermsItem) => (
                <li className={item.title ? "" : styles.flexLi} key={item.id}>
                  <strong>
                    {item.id} {item.title && `— ${item.title}`}
                  </strong>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
};

export default PrivacyPolicy;

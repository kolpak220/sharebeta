import React from "react";
import termsData from "../assets/termsOfService.json";
import styles from "./TermsOfService.module.css";

interface TermsItem {
  id: string;
  title?: string;
  text: string
}

const TermsOfService: React.FC = () => {
  return (
    <>
      <div className={styles.termsContainer}>
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
}

export default TermsOfService;
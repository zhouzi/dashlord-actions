import * as React from "react";
import { Info, Zap, ThumbsUp, Lock } from "react-feather";

import { isToolEnabled, slugifyUrl, btoa } from "../utils";
import { HTTP } from "./HTTP";
import { LightHouse } from "./LightHouse";
import { Nuclei } from "./Nuclei";
import { Owasp } from "./Owasp";
import { TestSSL } from "./TestSSL";
import { Trackers } from "./Trackers";
import { Wappalyzer } from "./Wappalyzer";
import { UpdownIo } from "./UpdownIo";
import { Dependabot } from "./Dependabot";
import { Codescan } from "./Codescan";
import { Nmap } from "./Nmap";
import { Stats } from "./Stats";
import { Report404 } from "./404";
import { Trivy } from "./Trivy";
import { DeclarationA11y } from "./DeclarationA11y";
import { Tab, TabContent } from "./UrlTabs";
import { UrlHeader } from "./UrlHeader";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type UrlDetailProps = { url: string; report: UrlReport; selectedTab?: string };

const Anchor = ({ id }: { id: string }) => <div id={id} />;

// define tabs structure
const tabs = [
  {
    label: "Bonnes pratiques",
    id: "best-practices",
    icon: <ThumbsUp size={16} style={{ marginRight: 5, marginBottom: -2 }} />,
    items: [
      {
        id: "lighthouse",
        reportKey: "lhr",
        render: (report, url) => (
          <LightHouse
            data={report.lhr}
            url={`${BASE_PATH}/report/${btoa(url)}/lhr.html`}
          />
        ),
      },
      {
        id: "thirdparties",
        render: (report, url) => <Trackers data={report.thirdparties} />,
      },
      {
        id: "stats",
        render: (report, url) => <Stats data={report.stats} url={url} />,
      },
      {
        id: "declaration-a11y",
        render: (report, url) => (
          <DeclarationA11y data={report["declaration-a11y"]} />
        ),
      },
      {
        id: "404",
        render: (report, url) =>
          report["404"].length && <Report404 data={report["404"]} />,
      },
    ],
  },
  {
    label: "Disponibilité",
    id: "disponibilite",
    icon: <Zap size={16} style={{ marginRight: 5, marginBottom: -2 }} />,
    items: [
      {
        id: "updownio",
        render: (report, url) => <UpdownIo data={report.updownio} url={url} />,
      },
    ],
  },
  {
    label: "Sécurité",
    id: "securite",
    icon: <Lock size={16} style={{ marginRight: 5, marginBottom: -2 }} />,
    items: [
      {
        id: "nmap",
        render: (report, url) => (
          <Nmap
            data={report.nmap}
            url={`${BASE_PATH}/report/${btoa(url)}/nmapvuln.html`}
          />
        ),
      },
      {
        id: "http",
        render: (report, url) => <HTTP data={report.http} />,
      },
      {
        id: "testssl",
        render: (report, url) => (
          <TestSSL
            data={report.testssl}
            url={`${BASE_PATH}/report/${btoa(url)}/testssl.html`}
          />
        ),
      },
      {
        id: "dependabot",
        render: (report, url) =>
          report.dependabot.repositories &&
          report.dependabot.repositories
            .filter(Boolean)
            .map((repository) => (
              <Dependabot key={repository.url} data={repository} url={url} />
            )),
      },
      {
        id: "codescan",
        render: (report, url) =>
          report.codescan.repositories &&
          report.codescan.repositories
            .filter(Boolean)
            .map((repository) => (
              <Codescan key={repository.url} data={repository} url={url} />
            )),
      },
      {
        id: "zap",
        render: (report, url) => (
          <Owasp
            data={report.zap}
            url={`${BASE_PATH}/report/${btoa(url)}/zap.html`}
          />
        ),
      },
      {
        id: "nuclei",
        render: (report, url) => <Nuclei data={report.nuclei} />,
      },
      {
        id: "trivy",
        render: (report, url) =>
          report["trivy"].length && <Trivy data={report["trivy"]} />,
      },
    ],
  },
  {
    label: "Informations",
    id: "informations",
    icon: <Info size={16} style={{ marginRight: 5, marginBottom: -2 }} />,
    items: [
      {
        id: "wappalyzer",
        render: (report, url) => <Wappalyzer data={report.wappalyzer} />,
      },
    ],
  },
];

export const Url: React.FC<UrlDetailProps> = ({ url, report, selectedTab }) => {
  React.useEffect(() => {
    const hash = document.location.hash.split("#");
    if (hash.length === 3) {
      // double hash + HashRouter workaround
      const target = document.getElementById(hash[2]);
      if (target) {
        target.scrollIntoView();
      }
    }
  }, [report]);

  if (!report) {
    return (
      <div>
        No data available for
        {url}
      </div>
    );
  }

  const selectedTabIndex: number = Math.max(
    0,
    tabs.findIndex((tab) => selectedTab === tab.id)
  );

  const selectedTabDefinition = tabs[selectedTabIndex];

  return (
    <>
      <UrlHeader report={report} url={url} />

      {/* custom DSFR Tabs renderer because of some react-dsfr issue */}
      <div className="fr-tabs">
        <ul className="fr-tabs__list" role="tablist">
          {tabs.map((tab, tabIndex) => (
            <Tab
              key={tab.id}
              selected={selectedTabDefinition.id === tab.id}
              index={tabIndex}
              href={`/url/${slugifyUrl(url)}/${tab.id}`}
              {...tab}
            />
          ))}
        </ul>
        {tabs.map((tab, tabIndex) => {
          // filter out invalid items
          const items = tab.items
            .filter(
              (item) =>
                !!report[item.reportKey || item.id] &&
                isToolEnabled(item.id as DashlordTool)
            )
            .map((item) => (
              <div key={item.id}>
                <Anchor id={item.id} />
                {item.render(report, url)}
              </div>
            ));

          return (
            <TabContent
              {...tab}
              key={tab.id}
              tabIndex={tabIndex}
              selected={selectedTabDefinition.id === tab.id}
              items={items}
            />
          );
        })}
      </div>
    </>
  );
};

// The three ways to install SV Node 1.2.3, in "Install SV Node": three boxes of the same size, side by side, each linking to its steps.
// Content only: edit the texts here. Facts come from the test log of the page (tarball, image and source build, 2026-11-05).

const routes = [
  {
    name: 'Linux binary',
    what: 'The release as published',
    points: [
      'Linux on x86_64 only, there is no Windows binary',
      'A checksum to verify the download',
      'Runs bitcoind straight from the archive',
    ],
    href: '#download-the-linux-binary',
  },
  {
    name: 'Docker image',
    what: 'A container from the official image',
    points: [
      'Pinned by tag, for example 1.2.3',
      'Generates a bitcoin.conf and keeps data in /data',
      'The route for hosts without a Linux binary',
    ],
    href: '#run-the-docker-image',
  },
  {
    name: 'Build from source',
    what: 'A build you control',
    points: [
      'For a custom build',
      'Needs GCC 10.2 or later and the build dependencies',
      'About 30 minutes on a GitHub-hosted runner (ubuntu-24.04)',
    ],
    href: '#build-from-source',
  },
];

export default function SvNodeInstallRoutes() {
  return (
    <figure className="not-prose my-8">
      <ul
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3"
        aria-label="Ways to install SV Node"
      >
        {routes.map((route) => (
          <li key={route.name} className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
              <span className="text-sm font-semibold">{route.name}</span>
            </div>
            <div className="flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <p className="m-0 mb-2 font-semibold text-gray-900 dark:text-gray-100">{route.what}</p>
              <ul className="m-0 list-disc space-y-1 pl-5">
                {route.points.map((point, i) => (
                  <li key={i} className="m-0">{point}</li>
                ))}
              </ul>
            </div>
            <a
              href={route.href}
              className="border-t border-gray-200 px-4 py-3 text-sm font-semibold text-[#1B1EA9] no-underline hover:underline dark:border-gray-700 dark:text-[#8C9BFF]"
            >
              Go to the steps →
            </a>
          </li>
        ))}
      </ul>
    </figure>
  );
}

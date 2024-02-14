module.exports = {
  analyzeCommits: {
    releaseRules: [
      {
        type: 'docs',
        scope: 'README',
        release: 'patch',
      },
    ],
  },

  branches: [
    'master',
    {
      name: 'prAllowPrereleaseAndVersionName',
      channel: 'alpha',
      prerelease: true,
    },
  ],

  ci: false,
  dryRun: false,
}

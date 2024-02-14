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
      name: 'allowPrereleaseAndVersionName',
      prerelease: true,
    },
  ],
}

# About

This is a very simple tool to synchronize your Freshbooks time entries with the Harvest time API.

# Setup

Create the file `default.json` in the config directory.

    {
      "freshbooks": {
        "url": "<your-url>",
        "token": "<your-token>"
      },
      "harvest": {
        "email": "<your-email>",
        "password": "<your-password>"
      }
    }
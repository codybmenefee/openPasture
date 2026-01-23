# Railway Branch Setup

## Completed Steps

1. ✅ Created `dev` branch from `main`
2. ✅ Pushed `dev` branch to origin
3. ✅ Created/linked to `development` environment in Railway
4. ✅ Linked `pipeline` service to `development` environment

## Current Status

- **Active Environment**: `development`
- **Active Service**: `pipeline`
- **Project**: `pan-grazing`

## Next Steps: Configure Branch-Based Deployments

To link the `dev` branch to the development environment, you need to configure this in the Railway dashboard:

### Option 1: Via Railway Dashboard (Recommended)

1. Go to your Railway project: `pan-grazing`
2. Navigate to your service (currently: `pipeline`)
3. Go to **Settings** → **Source**
4. Under **Branch Deployments**, configure:
   - **Production Environment**: Set to deploy from `main` branch
   - **Development Environment**: Set to deploy from `dev` branch

### Option 2: Via Railway CLI (if available)

You may need to configure this through the Railway API or dashboard, as branch-based deployments are typically managed through the service's GitHub integration settings.

## Current Configuration

- **Main Branch**: `main` → Should deploy to `production` environment
- **Dev Branch**: `dev` → Should deploy to `development` environment
- **Current Environment**: `development` (linked via CLI)

## Verifying Setup

After configuring branch deployments:

1. Make a commit to `dev` branch
2. Push to origin: `git push origin dev`
3. Check Railway dashboard to confirm deployment triggers from `dev` branch
4. Verify deployment goes to `development` environment

## Branch Protection (GitHub)

To "lock down" the main branch, set up branch protection rules in GitHub:

1. Go to your repository: https://github.com/codybmenefee/pan
2. Navigate to **Settings** → **Rules** → **Rulesets** → **New branch ruleset**

### For Main Branch Protection:

**Target Branches:**
- Click "Add target"
- Enter: `main` (or use pattern `main`)

**Rules to Enable (Recommended for Main Branch):**

**Essential Protection:**
- ✅ **Restrict deletions** (already checked - prevents accidental deletion)
- ✅ **Restrict updates** - Only allow users with bypass permission to update matching refs
- ✅ **Restrict creations** - Only allow users with bypass permission to create matching refs
- ✅ **Block force pushes** (already checked - prevents history rewriting)

**Workflow Enforcement:**
- ✅ **Require a pull request before merging** - All commits must be made to a non-target branch and submitted via PR
- ✅ **Require status checks to pass** - Choose which CI/CD checks must pass before merging
- ✅ **Require linear history** - Prevent merge commits from being pushed (optional, for cleaner history)

**Optional but Recommended:**
- ⚠️ **Require signed commits** - Commits must have verified signatures (if you use GPG signing)
- ⚠️ **Require deployments to succeed** - Configure to require successful deployment to Railway production environment before merging

**Enforcement Status:**
- Set to **"Enabled"** (not "Disabled")

### For Dev Branch (Optional but Recommended):

Create a separate ruleset for `dev` branch with:
- **Target Branches:** `dev`
- **Require deployments to succeed** - Link to Railway development environment
- **Require a pull request before merging** - Enforce code review even for dev branch
- **Block force pushes** - Prevent history rewriting

This ensures `main` can only be updated via pull requests from `dev` or other feature branches, and all changes are reviewed and tested before reaching production.

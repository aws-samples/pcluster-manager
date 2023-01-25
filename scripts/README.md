# How to use rollback/rollforward scripts

The rollback and rollforward scripts in this folder should be used when there are problems on a published release. In particular in the frontend or backend code.

To work properly, the scripts need Admin credentials of the account in which the public ECR is.

As the code is shipped as a Docker-based Lambda in a public ECR, to rollback the code we need to remove the "latest" tag from the broken released image and assign it to the image that was pushed before (latest-1 release).
So the customers won't pull the broken release again.

This is done by simply launching 

```
bash ./rollback_awslambda_image.sh
```

If the rollback script is launched by mistake, the rollforward script helps to restore the situation, putting the "latest" tag on the lastly pushed release, the script can be launched as

```
bash ./rollforward_awslambda_image.sh
```

**NOTE:** The rollforward script should be used only if the rollback script is launched by mistake, the normal procedure to publish a new release after a rollback is by launching the `build_and_release_image.sh` after fixing the code


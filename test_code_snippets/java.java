/**
 * Do awesome thing.
 */
@Override
@TargetApi(Build.VERSION_CODES.GINGERBREAD)
protected void onTryUpdate(int reason) throws RetryException {
    // Do some awesome stuff

    int foo = 15;
    publishArtwork(new Artwork.Builder()
            .title(photo.name)
            .imageUri(Uri.parse(photo.image_url))
            .viewIntent(new Intent(Intent.ACTION_VIEW,
                    Uri.parse("http://500px.com/photo/" + photo.id)))
            .build());
    scheduleUpdate(System.currentTimeMillis() + ROTATE_TIME_MILLIS);
}

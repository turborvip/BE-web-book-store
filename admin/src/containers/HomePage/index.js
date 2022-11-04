/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { get, upperFirst } from 'lodash';
import { auth, LoadingIndicatorPage } from 'strapi-helper-plugin';
import PageTitle from '../../components/PageTitle';
import { useModels } from '../../hooks';

import useFetch from './hooks';
import {Block, Container, P, Wave, Separator } from './components';
const HomePage = () => {
  const { collectionTypes, singleTypes, isLoading: isLoadingForModels } = useModels();

  const hasAlreadyCreatedContentTypes = useMemo(() => {
    const filterContentTypes = contentTypes => contentTypes.filter(c => c.isDisplayed);

    return (
      filterContentTypes(collectionTypes).length > 1 || filterContentTypes(singleTypes).length > 0
    );
  }, [collectionTypes, singleTypes]);

  if (isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  const headerId = hasAlreadyCreatedContentTypes
    ? 'HomePage.greetings'
    : 'app.components.HomePage.welcome';
  const username = get(auth.getUserInfo(), 'firstname', '');

  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {title => <PageTitle title={title} />}
      </FormattedMessage>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <Block>
              <Wave />
              <FormattedMessage
                id={headerId}
                values={{
                  name: upperFirst(username),
                }}
              >
                {msg => <h2 id="mainHeader">{msg}</h2>}
              </FormattedMessage>
              {hasAlreadyCreatedContentTypes ? (
                <FormattedMessage id="app.components.HomePage.welcomeBlock.content.again">
                  {msg => <P>{msg}</P>}
                </FormattedMessage>
              ) : (
                <FormattedMessage id="HomePage.welcome.congrats">
                  {congrats => {
                    return (
                      <FormattedMessage id="HomePage.welcome.congrats.content">
                        {content => {
                          return (
                            <FormattedMessage id="HomePage.welcome.congrats.content.bold">
                              {boldContent => {
                                return (
                                  <P>
                                    <b>{congrats}</b>&nbsp;
                                    {content}&nbsp;
                                    <b>{boldContent}</b>
                                  </P>
                                );
                              }}
                            </FormattedMessage>
                          );
                        }}
                      </FormattedMessage>
                    );
                  }}
                </FormattedMessage>
              )}
              <Separator style={{ marginTop: 37, marginBottom: 36 }} />
              <img style={{ height:80 }} src='https://bizweb.dktcdn.net/100/386/441/themes/869880/assets/fot_logo.png?1658716179964' alt=''/>
            </Block>
          </div>

          <div className="col-md-12 col-lg-4">
            <Block style={{ paddingRight: 30, paddingBottom: 0 }}>
              <FormattedMessage id="HomePage.community">{msg => <h2>{msg}</h2>}</FormattedMessage>
              <FormattedMessage id="app.components.HomePage.community.content">
                {content => <P style={{ marginTop: 7, marginBottom: 0 }}>{content}</P>}
              </FormattedMessage>
              <Separator style={{ marginTop: 18 }} />
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
